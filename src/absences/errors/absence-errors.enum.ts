export enum AbsencesErrorCodes {
  GlobalAdminsMustProvideCompanyIdError = 'GLOBAL_ADMINS_MUST_PROVIDE_COMPANY_ID_ERROR',
  AbsenceTypeNotFoundError = 'ABSENCE_TYPE_NOT_FOUND_ERROR',
  AbsenceAmountNotFoundError = 'ABSENCE_AMOUNT_NOT_FOUND_ERROR',
  StartDateMustBeGreaterThanEndDateError = 'START_DATE_MUST_BE_GREATER_THAN_END_DATE_ERROR',
  AbsenceBalanceNotSufficientError = 'ABSENCE_BALANCE_NOT_SUFFICIENT_ERROR',
  UserCannotBeHisOwnReplacementError = 'USER_CANNOT_BE_HIS_OWN_REPLACEMENT_ERROR',
  AbsenceMustBeAtLeastOneDayError = 'ABSENCE_MUST_BE_AT_LEAST_ONE_DAY_ERROR',
  AbsenceNotFoundError = 'ABSENCE_NOT_FOUND_ERROR',
  UserCannotUpdateOthersAbsenceError = 'USER_CANNOT_UPDATE_OTHERS_ABSENCE_ERROR',
  UserCannotRemoveOthersAbsenceError = 'USER_CANNOT_REMOVE_OTHERS_ABSENCE_ERROR',
  AbsenseAlreadyReviewedError = 'ABSENSE_ALREADY_APPROVED_ERROR',
}
