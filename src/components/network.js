import axios from 'axios'
export function request (config) {
    const instance = axios.create({
 
        // baseURL: "http://127.0.0.1:9906/"
        baseURL: "http://175.6.159.90:21906/"
        // baseURL:"http://172.19.104.48:9906"


    })

    instance.interceptors.request.use(info => { 
       
        // let token = sessionStorage.getItem("token")
        // if (token) {
        //     info.headers.token = token;   
            
        // }
        return info }, err => { alert('网络请求失败') })
    instance.interceptors.response.use(res => { return res.data }, err => { return {'msg':'网络错误 error','status':400} })

    return instance(config)
    
}
