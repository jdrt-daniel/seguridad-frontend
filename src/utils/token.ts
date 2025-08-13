/* eslint-disable @typescript-eslint/no-explicit-any */
import { decodeToken } from "react-jwt";
import { imprimir } from "@/utils/imprimir";
import dayjs from "dayjs";

interface DecodedToken {
  exp: number;
  [key: string]: any;
}

export const verificarToken = (token: string): boolean => {
  try {
    if (!token) {
      imprimir("❌ Token no proporcionado");
      return false;
    }

    const myDecodedToken = decodeToken(token) as DecodedToken;

    if (!myDecodedToken || !myDecodedToken.exp) {
      imprimir("❌ Token inválido o sin fecha de expiración");
      return false;
    }

    const caducidad = dayjs.unix(myDecodedToken.exp);
    const ahora = dayjs();
    const tiempoRestante = caducidad.diff(ahora, "minute");

    // Buffer de 5 minutos antes de la expiración
    const bufferMinutos = 5;
    const estaPorExpirar = tiempoRestante <= bufferMinutos;

    if (estaPorExpirar) {
      imprimir(`⚠️ Token expira en ${tiempoRestante} minutos`);
    } else {
      imprimir(`✅ Token válido, expira en ${tiempoRestante} minutos`);
    }

    return tiempoRestante > 0;
  } catch (error) {
    imprimir(
      `❌ Error al verificar token: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`
    );
    return false;
  }
};
