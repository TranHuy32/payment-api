export default class BaseController {
  protected data(data: any) {
    return {
      success: 1,
      message: 'SUCCESS',
      data,
    };
  }

  protected success() {
    return {
      success: 1,
      message: 'SUCCESS',
    };
  }

  protected fail(message = 'FAIL') {
    return {
      success: 0,
      message,
    };
  }

  protected response(response: any) {
    return response;
  }
}
