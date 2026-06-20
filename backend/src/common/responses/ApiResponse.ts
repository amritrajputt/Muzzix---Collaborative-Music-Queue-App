class ApiResponse{
    statusCode:number
    data:object
    message:string
    success:boolean
    constructor(statusCode:number, data:object, message:string){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = true
    }

   static success(statusCode:number, data:object, message:string){
    return new ApiResponse(statusCode,data,message)
   }
   static created(statusCode:number, data:object, message:string){
    return new ApiResponse(statusCode,data,message)
   }
   static deleted(statusCode:number, data:object, message:string){
    return new ApiResponse(statusCode,data,message)
   }
   static updated(statusCode:number, data:object, message:string){
    return new ApiResponse(statusCode,data,message)
   }
   static noContent(statusCode:number, data:object, message:string){
    return new ApiResponse(statusCode,data,message)
   }
}

export default ApiResponse