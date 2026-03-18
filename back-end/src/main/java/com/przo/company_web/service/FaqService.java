package com.przo.company_web.service;

import com.przo.company_web.entity.Faq;
import com.przo.company_web.repository.FaqRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FaqService {

    private final FaqRepository faqRepository;

    public List<Faq> getAll() {
        return faqRepository.findAllByOrderByOrderIndexAscIdAsc();
    }

    @Transactional
    public Faq create(String question, String answer) {
        int maxOrder = faqRepository.findAllByOrderByOrderIndexAscIdAsc()
                .stream().mapToInt(Faq::getOrderIndex).max().orElse(-1);
        Faq faq = new Faq();
        faq.setQuestion(question);
        faq.setAnswer(answer);
        faq.setOrderIndex(maxOrder + 1);
        return faqRepository.save(faq);
    }

    @Transactional
    public Faq update(Long id, String question, String answer) {
        return faqRepository.findById(id).map(faq -> {
            faq.setQuestion(question);
            faq.setAnswer(answer);
            return faqRepository.save(faq);
        }).orElse(null);
    }

    @Transactional
    public void reorder(List<Long> ids) {
        for (int i = 0; i < ids.size(); i++) {
            int order = i;
            faqRepository.findById(ids.get(i)).ifPresent(faq -> faq.setOrderIndex(order));
        }
    }

    @Transactional
    public boolean delete(Long id) {
        if (!faqRepository.existsById(id)) return false;
        faqRepository.deleteById(id);
        return true;
    }
}
