import api from "./api";

class JoinRoom{

    async joinRoom(spaceId:string,guestName:string,spacePassword:string){
        try {
            const response = await api.post("/spaces/join",{
                spaceId,
                guestName,
                spacePassword,
            })
            if(response.data.success){
                return response.data
            }else{
                return null
            }
        } catch (error) {
            console.error(error)
            return null
        }
    }
}
const joinRoomService = new JoinRoom()
export default joinRoomService;