import {defineStore} from "pinia";
import {ref} from "vue";

export const useTokenStore = defineStore('token',()=>{
    //响应式变量
    const token = ref('')
    //修改token的值
    const setToken = (newToken)=>{
        token.value = newToken
    }
    //移除token的值
    const removeToken = ()=>{
        token.value = ''
    }
    //返回响应式变量
    return {token,setToken,removeToken}
},{
    persist:true//持久化
});