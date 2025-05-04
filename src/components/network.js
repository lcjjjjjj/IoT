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

export function request_(config) {
    const instance = axios.create({
        baseURL: "http://39.103.172.54:8088/"
    })

    instance.interceptors.request.use(info => {
        info.headers.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOiLlvKDkuIkifQ.cEs9dVMZVtb1t5agxhgZr1c6c57PVD5z4KZWUdREEHU";
        return info
    }, err => { alert('网络请求失败') })
    instance.interceptors.response.use(res => { return res.data }, err => { return {'msg':'网络错误 error','status':400} })
    return instance(config)
}
