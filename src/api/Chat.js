import request from "@/utils/request";

//获取私信对像
export const getUserChatService = (username) => {
  return request.get("/chat?username="+username);
};