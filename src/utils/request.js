//定制请求的实例

//导入axios  npm install axios
import axios from 'axios';
import {ElMessage} from "element-plus";
import {useTokenStore} from "@/stores/token";
//定义一个变量,记录公共的前缀  ,  baseURL
const baseURL = '/api';
const instance = axios.create({baseURL})

//添加请求拦截器
instance.interceptors.request.use(
    config => {
        //请求前回调
        //添加token
        const tokenStore = useTokenStore();
        if (tokenStore.token) {
            config.headers.Authorization = tokenStore.token;
        }
        return config;
    },
    (err) => {
        //请求失败回调
        return Promise.reject(err);//异步的状态转化成失败的状态
    }
)

//添加响应拦截器
instance.interceptors.response.use(
    result=>{
        //判断业务状态码
        if (result.data.code===0){
            //成功返回数据
            return result.data;
        }
        //提示错误信息
        ElMessage.error(result.data.message?result.data.message:'服务异常')
        //异步操作状态转换为失败
        return Promise.reject(result.data);
    },
    err=>{
        alert('服务异常');
        return Promise.reject(err);//异步的状态转化成失败的状态
    }
)

export default instance;