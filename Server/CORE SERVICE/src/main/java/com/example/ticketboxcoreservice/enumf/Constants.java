package com.example.ticketboxcoreservice.enumf;

import lombok.RequiredArgsConstructor;


public class Constants {
    // image
    public static final Long DEFAULT_AVATAR_IMG_ID = 1l;
    public static final Long DEFAULT_CATEGORY_IMAGE_ID = 2l;
    public static final Long DEFAULT_PRODUCT_IMAGE_ID = 3l;
    public static final Long DEFAULT_SHOP_BANNER_ID =  6l;

    // event
    public static final Integer EVENT_STATUS_DECLINED = -1; // event creation request get declination from approvers
    public static final Integer EVENT_STATUS_CANCELED = 0; // event creation request get canceled by its creator
    public static final Integer EVENT_STATUS_PENDING = 1; // event creation request is pending
    public static final Integer EVENT_STATUS_UPCOMING = 2; // event creation request is approved and today is before its start date
    public static final Integer EVENT_STATUS_RUNNING = 3;
    public static final Integer EVENT_STATUS_ENDED = 4; // event creation request is approved and today is after its end date

    // Ticket
    public static final Integer TICKET_STATUS_DECLINED = -1; // ticket creation request get declination from approvers
    public static final Integer TICKET_STATUS_CANCELED = 0; // ticket creation request get canceled by its creator
    public static final Integer TICKET_STATUS_PENDING = 1; // ticket creation request is pending
    public static final Integer TICKET_STATUS_UPCOMING = 2; // ticket is approved and today is before start sale date
    public static final Integer TICKET_STATUS_REMAINING = 3; // ticket is approved and sold ticket is lower to capacity and today is between start and end date
    public static final Integer TICKET_STATUS_SOLD_OUT = 4; // ticket is approved and sold ticket is equal to capacity and today is between start and end date
    public static final Integer TICKET_STATUS_ENDED = 5; // ticket is approved and today is after end sale date

    // Order
    public static final Integer ORDER_STATUS_DECLINED = -1; // order payment is declined by payment system
    public static final Integer ORDER_STATUS_PENDING = 1; // order payment is waiting for response from payment system
    public static final Integer ORDER_STATUS_NOT_PURCHASED = 0; // order is not purchased, which plays as a cart
    public static final Integer ORDER_STATUS_PURCHASED = 2; // order is purchased

    // OrderTicket
    public static final Integer ORDER_TICKET_STATUS_INACTIVE = 0; // order ticket is created and order is not purchased
    public static final Integer ORDER_TICKET_STATUS_ACTIVE = 1; // order ticket is created and order is purchased => QR code is generated
    public static final Integer ORDER_TICKET_STATUS_USED = 3; // QR code is scanned
    public static final Integer ORDER_TICKET_STATUS_PENDING = 2;
}
