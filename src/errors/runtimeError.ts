export class RuntimeError extends Error {
    //
}

export class CleanupFailed extends RuntimeError {
    static datoApiReturnedWithAnError(): CleanupFailed {
        return new CleanupFailed(`Cleanup failed due to an error response from the DatoCMS API.`);
    }
}
