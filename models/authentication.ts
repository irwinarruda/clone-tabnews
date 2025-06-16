import { isIntendedError, UnauthorizedError } from "~/infra/errors";
import password from "~/models/password";
import user from "~/models/user";

type CreateSessionDTO = {
  email: string;
  password: string;
};

async function getAuthenticatedUser(credentials: CreateSessionDTO) {
  try {
    const authUser = await user.findByEmail(credentials.email);
    const isCorrectPassword = await password.compareHash(
      credentials.password,
      authUser.password,
    );
    if (!isCorrectPassword) throw new UnauthorizedError();
    return authUser;
  } catch (err) {
    if (!isIntendedError(err)) throw err;
    throw new UnauthorizedError(
      "Os dados de autenticação não conferem.",
      "Por favor revise os dados e tente novamente.",
    );
  }
}

export default { getAuthenticatedUser };
