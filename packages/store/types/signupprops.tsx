export type userSignupData={
    name:string,
    username:string,
    password:string
}
export interface SignupProps{
    onClick:(data:userSignupData)=>Promise<void>
}