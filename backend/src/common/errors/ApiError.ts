class ApiError extends Error{
    statusCode:number
    status:string
    isOperational:boolean

    constructor(message:string, statusCode:number){
        super(message)
        this.statusCode = statusCode
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'
        this.isOperational = true
    }
    static badRequest(message:string){
        return new ApiError(message,400)
    }
    static unauthorized(message:string){
        return new ApiError(message,401)
    }
    static forbidden(message:string){
        return new ApiError(message,403)
    }
    static notFound(message:string){
        return new ApiError(message,404)
    }
    static internalServerError(message:string){
        return new ApiError(message,500)
    }
}

export default ApiError