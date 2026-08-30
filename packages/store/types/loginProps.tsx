export type userData={
    username:string,
   
    password:string
}

export interface LoginProps{
    onClick:(data:userData)=>Promise<void>
    // Optional UI customization — defaults are provided inside the component.
    // Existing callers that only pass onClick continue to work unchanged.
    title?: string
    subtitle?: string
    buttonText?: string
    signupText?: string
    onSignupClick?: () => void
}