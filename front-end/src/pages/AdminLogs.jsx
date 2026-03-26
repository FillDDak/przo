import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./AdminLogs.css";

const SIBLINGS = 2; // 현재 페이지 양쪽에 보여줄 페이지 수

const getPageNumbers = (current, total) => {
    const pages = [];
    const start = Math.max(0, current - SIBLINGS);
    const end = Math.min(total - 1, current + SIBLINGS);
    if (start > 0) pages.push(0, start > 1 ? "..." : null);
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < total - 1) pages.push(end < total - 2 ? "..." : null, total - 1);
    return pages.filter((p) => p !== null);
};

const AdminLogs = () => {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const PAGE_SIZE = 30;

    useEffect(() => {
        if (!isAdmin) {
            navigate("/admin", { replace: true });
        }
    }, [isAdmin, navigate]);

    useEffect(() => {
        if (!isAdmin) return;
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `/api/admin/logs?page=${page}&size=${PAGE_SIZE}`,
                    { credentials: "include" }
                );
                if (res.ok) {
                    const data = await res.json();
                    setLogs(data.content || []);
                    setTotalPages(data.totalPages || 0);
                }
            } catch (e) {
                console.error("로그 조회 실패:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, [isAdmin, page]);

    const pageNumbers = getPageNumbers(page, totalPages);

    return (
        <div className="admin-logs">
            <div className="admin-logs__panel">
                <div className="admin-logs__header">
                    <h1 className="admin-logs__title">로그인 시도 기록</h1>
                    <button className="admin-logs__back" onClick={() => navigate("/admin")}>
                        ← 돌아가기
                    </button>
                </div>

                <p className="admin-logs__notice">관리자 페이지 로그인 시도 기록입니다. 개인정보보호법에 따라 각 접속 기록은 180일간 보관되며, 이후 매일 새벽 3시에 자동으로 삭제됩니다.</p>

                {loading ? (
                    <p className="admin-logs__status">불러오는 중...</p>
                ) : logs.length === 0 ? (
                    <p className="admin-logs__status">기록이 없습니다.</p>
                ) : (
                    <>
                        <div className="admin-logs__table-wrap">
                            <table className="admin-logs__table">
                                <thead>
                                    <tr>
                                        <th>시각</th>
                                        <th>아이디</th>
                                        <th className="col-ip">IP</th>
                                        <th className="col-location">위치</th>
                                        <th>결과</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => (
                                        <tr key={log.id} className={log.success ? "" : "admin-logs__row--fail"}>
                                            <td>{log.attemptedAt}</td>
                                            <td>{log.username}</td>
                                            <td className="col-ip">{log.ip}</td>
                                            <td className="col-location">{log.location}</td>
                                            <td>
                                                <span className={`admin-logs__badge ${log.success ? "admin-logs__badge--success" : "admin-logs__badge--fail"}`}>
                                                    {log.success ? "성공" : "실패"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="admin-logs__pagination">
                                <button
                                    className="admin-logs__page-btn"
                                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                >
                                    ‹
                                </button>
                                {pageNumbers.map((p, i) =>
                                    p === "..." ? (
                                        <span key={`ellipsis-${i}`} className="admin-logs__ellipsis">…</span>
                                    ) : (
                                        <button
                                            key={p}
                                            className={`admin-logs__page-btn ${p === page ? "admin-logs__page-btn--active" : ""}`}
                                            onClick={() => setPage(p)}
                                        >
                                            {p + 1}
                                        </button>
                                    )
                                )}
                                <button
                                    className="admin-logs__page-btn"
                                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                                    disabled={page >= totalPages - 1}
                                >
                                    ›
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminLogs;
