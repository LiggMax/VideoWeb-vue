import {defineStore} from "pinia";
import {ref} from "vue";

const useUserInfoStore = defineStore('userInfo',()=>{
    //定义用户状态相关内容

    //定义响应式变量
    const info = ref({})
    //修改响应式变量的值
    const setInfo = (newInfo)=>{
        info.value = newInfo
    }
    //移除响应式变量的值
    const removeInfo = ()=>{
        info.value = {}
    }
    return {info,setInfo,removeInfo}
},{persist:true});
// 导出
export default useUserInfoStore;
