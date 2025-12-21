package com.example.ticketboxcoreservice.model.entity;


import com.example.ticketboxcoreservice.enumf.Constants;
import com.example.ticketboxcoreservice.enumf.ErrorCode;
import com.example.ticketboxcoreservice.exception.AppException;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "s_event")
@Builder()
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @Column(name = "onl")
    private Boolean online;
    @Column(name = "addr")
    private String address;
    private String orgName;
    private String orgInfo;
    private Integer status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime createDate;
    private LocalDateTime updateDate;

    @OneToOne(fetch = FetchType.LAZY,cascade = {CascadeType.PERSIST,CascadeType.MERGE,CascadeType.DETACH,CascadeType.REFRESH})
    @JoinColumn(name = "info_id", referencedColumnName = "id")
    private Pdf info;

    @OneToOne(fetch = FetchType.LAZY,cascade = {CascadeType.PERSIST,CascadeType.MERGE,CascadeType.DETACH,CascadeType.REFRESH})
    @JoinColumn(name = "contract_id", referencedColumnName = "id")
    private Pdf contract;

    @OneToOne(fetch = FetchType.LAZY,cascade = {CascadeType.PERSIST,CascadeType.MERGE,CascadeType.DETACH,CascadeType.REFRESH})
    @JoinColumn(name = "img_id", referencedColumnName = "id")
    private Image img;
    @OneToOne(fetch = FetchType.LAZY,cascade = {CascadeType.PERSIST,CascadeType.MERGE,CascadeType.DETACH,CascadeType.REFRESH})
    @JoinColumn(name = "banner_id", referencedColumnName = "id")
    private Image banner;
    @ManyToOne(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST,CascadeType.MERGE,CascadeType.DETACH,CascadeType.REFRESH})
    @JoinColumn(name = "host_id", referencedColumnName = "id")
    private User host;
    @ManyToOne(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST,CascadeType.MERGE,CascadeType.DETACH,CascadeType.REFRESH})
    @JoinColumn(name = "approver_id", referencedColumnName = "id")
    private User approver;
    @OneToMany(mappedBy = "event", fetch = FetchType.LAZY,cascade = CascadeType.ALL)
    private Set<Ticket> tickets = new HashSet<>();
    @ManyToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinTable(name = "s_cat_event",
            joinColumns = @JoinColumn(name = "s_event.id"),
            inverseJoinColumns = @JoinColumn(name = "s_category.id")
    )
    @JsonIgnore
    private Set<Category> categories = new HashSet<>();

    public void approve() {
        updateDate = LocalDateTime.now();
        if (LocalDateTime.now().isBefore(startDate)) status = Constants.EVENT_STATUS_UPCOMING;
        else if (LocalDateTime.now().isAfter(endDate)) status = Constants.EVENT_STATUS_ENDED;
        else status = Constants.EVENT_STATUS_RUNNING;
        for (Ticket ticket : tickets) ticket.approve();
    }
    public void cancel() {
        updateDate = LocalDateTime.now();
        if (status.equals(Constants.EVENT_STATUS_PENDING)) status = Constants.EVENT_STATUS_CANCELED;
        else throw new AppException(ErrorCode.ONLY_PENDING_EVENT_IS_UPDATABLE);
        for (Ticket ticket : tickets) ticket.cancel();
    }
    public void decline() {
        updateDate = LocalDateTime.now();
        if (status.equals(Constants.EVENT_STATUS_PENDING)) status = Constants.EVENT_STATUS_DECLINED;
        else throw new AppException(ErrorCode.ONLY_PENDING_EVENT_IS_UPDATABLE);
        for (Ticket ticket : tickets) ticket.decline();
    }
}
