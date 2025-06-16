export class InternalServerError extends Error {
  action: string;
  statusCode: number;
  constructor(cause: Error, statusCode = 500) {
    super("Um erro interno não esperado aconteceu.", { cause });
    this.name = "InternalServerError";
    this.action = "Entre em contato com o suporte.";
    this.statusCode = statusCode;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class ServiceError extends Error {
  action: string;
  statusCode: number;
  constructor(cause: Error, message = "Serviço indisponível no momento.") {
    super(message, { cause });
    this.name = "ServiceError";
    this.action = "Verifique se o serviço está disponível.";
    this.statusCode = 503;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class ValidationError extends Error {
  action: string;
  statusCode: number;
  constructor(
    message = "Um erro de validação ocorreu.",
    action = "Ajuste os dados enviados e tente novamente.",
  ) {
    super(message);
    this.name = "ValidationError";
    this.action = action;
    this.statusCode = 400;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class UnauthorizedError extends Error {
  action: string;
  statusCode: number;
  constructor(
    message = "Os dados de autenticação não conferem.",
    action = "Por favor revise os dados e tente novamente.",
    cause?: Error,
  ) {
    super(message, { cause });
    this.name = "UnauthorizedError";
    this.action = action;
    this.statusCode = 401;
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class NotFoundError extends Error {
  action: string;
  statusCode: number;
  constructor(
    message = "Não foi possível encontrar este recurso no sistema",
    action = "Ajuste os filtros enviados e tente novamente.",
  ) {
    super(message);
    this.name = "NotFoundError";
    this.action = action;
    this.statusCode = 404;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class MethodNotAllowedError extends Error {
  action: string;
  statusCode: number;
  constructor() {
    super("Método não permitido para este endpoint.");
    this.name = "MethodNotAllowedError";
    this.action =
      "Verifique se o método HTTP enviado é válido para este endpoint.";
    this.statusCode = 405;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export function isIntendedError(
  err: unknown,
): err is NotFoundError | UnauthorizedError | ValidationError {
  return (
    err instanceof NotFoundError ||
    err instanceof UnauthorizedError ||
    err instanceof ValidationError
  );
}
