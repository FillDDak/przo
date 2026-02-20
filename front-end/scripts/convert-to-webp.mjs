import sharp from 'sharp';
import { readdir, readFile, writeFile, unlink, stat } from 'fs/promises';
import { join, extname, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = join(__dirname, '../src/assets');
const SRC_DIR = join(__dirname, '../src');
const TARGET_EXTS = ['.jpg', '.jpeg', '.png'];
const SOURCE_EXTS = ['.jsx', '.js', '.ts', '.tsx', '.css'];
const QUALITY = 85;

// 변환할 이미지 파일 목록 수집
async function collectImages(dir) {
  const results = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...await collectImages(fullPath));
    } else if (TARGET_EXTS.includes(extname(entry.name).toLowerCase())) {
      results.push(fullPath);
    }
  }
  return results;
}

// 소스 파일 목록 수집
async function collectSourceFiles(dir) {
  const results = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      results.push(...await collectSourceFiles(fullPath));
    } else if (SOURCE_EXTS.includes(extname(entry.name).toLowerCase())) {
      results.push(fullPath);
    }
  }
  return results;
}

// 이미지 변환
async function convertImages(images) {
  let totalBefore = 0;
  let totalAfter = 0;
  const converted = [];

  for (const imgPath of images) {
    const ext = extname(imgPath).toLowerCase();
    const webpPath = imgPath.slice(0, -ext.length) + '.webp';
    const fileName = basename(imgPath);

    try {
      const { size: before } = await stat(imgPath);
      totalBefore += before;

      await sharp(imgPath).webp({ quality: QUALITY }).toFile(webpPath);

      const { size: after } = await stat(webpPath);
      totalAfter += after;

      const reduction = (((before - after) / before) * 100).toFixed(1);
      console.log(`  ✓ ${fileName} (${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB, -${reduction}%)`);

      converted.push({ original: imgPath, webp: webpPath, ext });
    } catch (err) {
      console.error(`  ✗ ${fileName}: ${err.message}`);
    }
  }

  return { converted, totalBefore, totalAfter };
}

// 소스 파일 내 경로 수정
async function updateSourceFiles(sourceFiles, converted) {
  let updatedCount = 0;

  for (const srcFile of sourceFiles) {
    let content = await readFile(srcFile, 'utf-8');
    let changed = false;

    for (const { ext } of [...new Set(converted.map(c => ({ ext: c.ext })))]) {
      // .png, .jpg, .jpeg 참조를 .webp로 교체
      const regex = new RegExp(`(["'\`])([^"'\`]*${ext.replace('.', '\\.')})\\1`, 'gi');
      const newContent = content.replace(regex, (match, quote, path) => {
        changed = true;
        return `${quote}${path.slice(0, -ext.length)}.webp${quote}`;
      });
      content = newContent;
    }

    if (changed) {
      await writeFile(srcFile, content, 'utf-8');
      console.log(`  ✓ ${basename(srcFile)} 경로 수정됨`);
      updatedCount++;
    }
  }

  return updatedCount;
}

// 원본 파일 삭제
async function deleteOriginals(converted) {
  for (const { original } of converted) {
    await unlink(original);
  }
}

// 메인 실행
async function main() {
  console.log('=== WebP 변환 시작 ===\n');

  console.log('📁 이미지 파일 검색 중...');
  const images = await collectImages(ASSETS_DIR);
  console.log(`   총 ${images.length}개 파일 발견\n`);

  console.log('🔄 이미지 변환 중 (품질: 85)...');
  const { converted, totalBefore, totalAfter } = await convertImages(images);

  const totalReduction = (((totalBefore - totalAfter) / totalBefore) * 100).toFixed(1);
  console.log(`\n   합계: ${(totalBefore / 1024 / 1024).toFixed(1)}MB → ${(totalAfter / 1024 / 1024).toFixed(1)}MB (-${totalReduction}%)\n`);

  console.log('📝 소스 파일 경로 수정 중...');
  const sourceFiles = await collectSourceFiles(SRC_DIR);
  const updatedCount = await updateSourceFiles(sourceFiles, converted);
  console.log(`   ${updatedCount}개 파일 수정됨\n`);

  console.log('🗑️  원본 파일 삭제 중...');
  await deleteOriginals(converted);
  console.log(`   ${converted.length}개 원본 파일 삭제됨\n`);

  console.log('=== 변환 완료 ===');
  console.log(`총 절약: ${((totalBefore - totalAfter) / 1024 / 1024).toFixed(1)}MB`);
}

main().catch(console.error);
