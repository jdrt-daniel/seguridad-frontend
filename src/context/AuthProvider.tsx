"use client";
import { createContext, ReactNode, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { Constantes } from "@/config";
import { imprimir } from "@/utils/imprimir";
import { Enforcer } from "casbin";
import {
    delay,
    guardarCookie,
    leerCookie,
} from "@/utils";


import { Servicios } from "@/services";
import { useCasbinEnforcer } from "@/hooks/use-casbin-enforcer";
import { useSession } from "@/hooks/use-session";

interface ContextProps {
    cargarUsuarioManual: () => Promise<void>;
    inicializarUsuario: () => Promise<void>;
    estaAutenticado: boolean;
    usuario: any | null;
    rolUsuario: any | undefined;
    setRolUsuario: ({ idRol }: { idRol: string }) => Promise<void>;
    ingresar: ({ usuario, contrasena }: { usuario: string; contrasena: string }) => Promise<void>;
    progresoLogin: boolean;
    permisoUsuario: (routerName: string) => Promise<any>;
    permisoAccion: (objeto: string, accion: string) => Promise<boolean>;
}

const AuthContext = createContext<ContextProps>({} as ContextProps);

interface AuthContextType {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthContextType) => {
    const [user, setUser] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const router = useRouter();

    const { sesionPeticion, borrarCookiesSesion } = useSession();
    const { inicializarCasbin, interpretarPermiso, permisoSobreAccion } =
        useCasbinEnforcer();
    const [enforcer, setEnforcer] = useState<Enforcer>();

    const inicializarUsuario = async () => {
        const token = leerCookie("token");

        if (!token) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            await guardarSesionUsuario();

            await delay(1000);
        } catch (error: Error | any) {
            imprimir(`Error durante inicializarUsuario 🚨`, typeof error, error);
            borrarSesionUsuario();

            router.replace("/login");
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const guardarSesionUsuario = async () => {
        await obtenerUsuarioRol();
        await obtenerPermisos();
    };

    const borrarSesionUsuario = () => {
        setUser(null);
        borrarCookiesSesion();
    };

    const cargarUsuarioManual = async () => {
        try {
            await guardarSesionUsuario();
            await delay(1000);

            router.replace("/dashboard");
        } catch (error: Error | any) {
            imprimir(`Error durante cargarUsuarioManual 🚨`, error);
            borrarSesionUsuario();

            imprimir(`🚨 -> login`);
            router.replace("/login");
            throw error;
        } finally {
        }
    };

    const login = async ({ usuario, contrasena }: { usuario: string; contrasena: string }) => {
        try {
            setLoading(true);
            await delay(1000);
            const respuesta = await Servicios.post({
                url: `${Constantes.baseUrl}/auth`,
                body: { usuario, contrasena: btoa(contrasena) },
                headers: {},
            });

            guardarCookie("token", respuesta.datos?.access_token);
            imprimir(`Token ✅: ${respuesta.datos?.access_token}`);

            setUser(respuesta.datos);
            imprimir(`Usuarios ✅`, respuesta.datos);
            await delay(1000);
            await obtenerPermisos();
            router.replace("/dashboard");
        } catch (e) {

            imprimir(`Error al iniciar sesión: `, e);
            borrarSesionUsuario();
            throw e;
        } finally {
            setLoading(false);
        }
    };

    const CambiarRol = async ({ idRol }: { idRol: string }) => {
        imprimir(`Cambiando rol 👮‍♂️: ${idRol}`);
        await actualizarRol({ idRol });
        await obtenerPermisos();
        router.replace("/dashboard");
    };

    const actualizarRol = async ({ idRol }: { idRol: string }) => {
        const respuestaUsuario = await sesionPeticion({
            method: "patch",
            url: `${Constantes.baseUrl}/cambiarRol`,
            body: {
                idRol,
            },
        });

        guardarCookie("token", respuestaUsuario.datos?.access_token);
        imprimir(`Token ✅: ${respuestaUsuario.datos?.access_token}`);

        setUser(respuestaUsuario.datos);
        imprimir(
            `rol definido en obtenerUsuarioRol 👨‍💻: ${respuestaUsuario.datos.idRol}`
        );
    };

    const obtenerPermisos = async () => {
        const respuestaPermisos = await sesionPeticion({
            url: `${Constantes.baseUrl}/autorizacion/permisos`,
        });

        setEnforcer(await inicializarCasbin(respuestaPermisos.datos));
    };

    const obtenerUsuarioRol = async () => {
        const respuestaUsuario = await sesionPeticion({
            url: `${Constantes.baseUrl}/usuarios/cuenta/perfil`,
        });

        setUser(respuestaUsuario.datos);
        imprimir(
            `rol definido en obtenerUsuarioRol 👨‍💻: ${respuestaUsuario.datos.idRol}`
        );
    };

    const rolUsuario = () => user?.roles.find((rol: any) => rol.idRol == user?.idRol);

    return (
        <AuthContext.Provider
            value={{
                cargarUsuarioManual,
                inicializarUsuario,
                estaAutenticado: !!user && !loading,
                usuario: user,
                rolUsuario: rolUsuario(),
                setRolUsuario: CambiarRol,
                ingresar: login,
                progresoLogin: loading,
                permisoUsuario: (routerName: string) =>
                    interpretarPermiso({ routerName, enforcer, rol: rolUsuario()?.rol }),
                permisoAccion: (objeto: string, accion: string) =>
                    permisoSobreAccion({
                        objeto,
                        enforcer,
                        rol: rolUsuario()?.rol ?? "",
                        accion,
                    }),
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
