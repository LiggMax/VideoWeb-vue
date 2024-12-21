import request from "@/utils/request";

//获取私信对像
export const getUserChatService = (username) => {
  return request.get("/user/chat?username="+username);
};

// 获取聊天历史记录
export const getChatHistoryService = (user1, user2) => {
  return request.get(`/user/history?user1=${user1}&user2=${user2}`);
};

// 获取所有未读消息数量
export const getUnreadCountService = (username) => {
  return request.get(`/user/unread?username=${username}`);
};

// 标记消息为已读
export const markAsReadService = (fromUser, toUser) => {
  return request.post(`/user/mark-read?fromUser=${fromUser}&toUser=${toUser}`);
};

// 获取用户在线状态
export const getOnlineStatusService = (usernames) => {
  return request.get('/user/online-status', {
    params: {
      usernames: usernames.join(',')
    }
  });
};