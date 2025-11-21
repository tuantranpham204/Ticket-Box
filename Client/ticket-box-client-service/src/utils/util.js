export const CAT = {
  MUSIC: 1,
  STAGEART: 2,
  SPORTS: 3,
  OTHER: 4,
};

export const EVENT_STATUS = {
  DECLINED: -1, // event creation request get declination from approvers
  CANCELED: 0, // event creation request get canceled by its creator
  PENDING: 1, // event creation request is pending
  UPCOMING: 2, // event creation request is approved and today is before its start date
  RUNNING: 3,
  ENDED: 4,
};

export const TICKET_STATUS = {
  DECLINED: -1, // ticket creation request get declination from approvers
  CANCELED: 0, // ticket creation request get canceled by its creator
  PENDING: 1, // ticket creation request is pending
  UPCOMING: 2, // ticket creation request is approved and today is before its start date
  RUNNING: 3,
  ENDED: 4,
};

export const ORDER_STATUS = {
  DECLINED: -1, // // order payment is declined by payment system
  NOT_PURCHASED: 0, // torder payment is waiting for response from payment system
  PENDING: 1, // order is not purchased, which plays as a cart
  PURCHASED: 2, // order is purchased
};

export const ORDER_TICKET_STATUS = {
  INACTIVE: 0, // order ticket is created and order is not purchased
  ACTIVE: 1, // order ticket is created and order is purchased => QR code is generated
  USED: 3, // QR code is scanned
  PENDING: 2,
};
