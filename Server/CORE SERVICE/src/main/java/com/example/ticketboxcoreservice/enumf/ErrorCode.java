package com.example.ticketboxcoreservice.enumf;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public enum ErrorCode {
    INTERNAL_ERROR(500, "Internal server error", HttpStatus.INTERNAL_SERVER_ERROR),
    USER_EXISTED(400, "User already exists", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(404, "User does not exist", HttpStatus.NOT_FOUND),
    USER_UNAUTHENTICATED(401, "User is not authenticated", HttpStatus.UNAUTHORIZED),
    USER_LOGGED_OUT(401, "User is logged out", HttpStatus.UNAUTHORIZED),
    TOKEN_EXPIRED(400, "Token expired", HttpStatus.BAD_REQUEST),
    USERNAME_CAN_NOT_BE_CHANGED(400, "User name can not be changed", HttpStatus.BAD_REQUEST),
    USER_ALREADY_EXISTS(400, "User already exists", HttpStatus.BAD_REQUEST),
    INVALID_TICKET_SALE_DATE(400, "Ticket sale date is invalid", HttpStatus.BAD_REQUEST),
    USER_IS_ALREADY_APPROVER(400, "User is already an approver", HttpStatus.BAD_REQUEST),
    ADMIN_CANNOT_REGISTER_APPROVER(400, "As an admin, user cannot register to be an approver", HttpStatus.BAD_REQUEST),

    NON_APPROVERS_CANNOT_APPROVE_OR_DECLINE_EVENTS(400, "Only approvers can make approval or declination to events", HttpStatus.BAD_REQUEST),
    ONLY_HOST_CAN_UPDATE_EVENT(400, "Only creator of the event can make changes to it", HttpStatus.BAD_REQUEST),
    ONLY_PENDING_EVENT_IS_UPDATABLE(400, "Only pending events can be made changes", HttpStatus.BAD_REQUEST),
    ONLY_HOST_CAN_UPDATE_TICKET(400, "Only creator of the event can make changes to its tickets", HttpStatus.BAD_REQUEST),
    ONLY_PENDING_TICKET_IS_UPDATABLE(400, "Only pending ticket can be made changes", HttpStatus.BAD_REQUEST),
    ONLY_APPROVERS_OF_EVENTS_CAN_APPROVE_THEIR_TICKETS(400, "Only approver of the event can make approval or declination to its ticket",HttpStatus.BAD_REQUEST),
    SOLD_TICKET_CANNOT_EXCEED_ITS_CAPACITY(400, "Number of sold ticket cannot exceed its capacity", HttpStatus.BAD_REQUEST),
    ONLY_CART_IS_UPDATABLE(400, "Only carts can be made changes", HttpStatus.BAD_REQUEST),
    ONLY_INACTIVE_ORDER_TICKETS_IS_UPDATABLE_AND_REMOVABLE(400, "Only inactive order tickets are updatable or removable", HttpStatus.BAD_REQUEST),

    INVALID_NUMBER_OF_CARTS(400, "Only 1 cart per person allowed", HttpStatus.BAD_REQUEST),


    ;
    private int code;
    private String message;
    private HttpStatus status;
}
