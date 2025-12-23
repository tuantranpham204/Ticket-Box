package com.example.ticketboxcoreservice.service;

import com.example.ticketboxcoreservice.enumf.Constants;
import com.example.ticketboxcoreservice.exception.ResourceNotFoundException;
import com.example.ticketboxcoreservice.model.dto.response.CategoryResponse;
import com.example.ticketboxcoreservice.model.dto.response.CustomPage;
import com.example.ticketboxcoreservice.model.dto.response.MessageResponse;
import com.example.ticketboxcoreservice.model.entity.Category;
import com.example.ticketboxcoreservice.model.entity.Event;
import com.example.ticketboxcoreservice.model.entity.Ticket;
import com.example.ticketboxcoreservice.repository.CategoryRepository;
import com.example.ticketboxcoreservice.repository.EventRepository;
import com.example.ticketboxcoreservice.repository.ImageRepository;
import com.example.ticketboxcoreservice.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private CategoryRepository categoryRepository;
    private ImageRepository imageRepository;
    private EventRepository eventRepository;
    private ModelMapper mapper;
    public MessageResponse addEventToCategory(Long categoryId, Long eventId) {
        Event event = eventRepository.findById(eventId).orElseThrow(
                () -> new ResourceNotFoundException("event", "eventId", eventId)
        );
        Category category = categoryRepository.findById(categoryId).orElseThrow(
                () -> new ResourceNotFoundException("category", "categoryId", categoryId)
        );
        category.addEvent(event);
        categoryRepository.save(category);
//        category.setImage(imageRepository.findById(Constants.DEFAULT_CATEGORY_IMAGE_ID).orElseThrow(
//                () -> new ResourceNotFoundException("image id", "image", Constants.DEFAULT_CATEGORY_IMAGE_ID)
//        ));
        return new MessageResponse("Category {id:" + categoryId + "} has added with the event {id:" + eventId + "}");
    }
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id).orElseThrow(
                () -> new ResourceNotFoundException("category", "categoryId", id)
        );
        return mapper.map(category, CategoryResponse.class);
    }
    public CustomPage<CategoryResponse> getAllCategory(Pageable pageable) {
        Page<Category> categories = categoryRepository.findAll(pageable);
        return CustomPage.<CategoryResponse>builder()
                .pageNo(categories.getNumber() + 1)
                .pageSize(categories.getSize())
                .pageContent(categories.getContent().stream()
                        .map(category -> mapper.map(category, CategoryResponse.class))
                        .collect(Collectors.toList()))
                .build();
    }
}
