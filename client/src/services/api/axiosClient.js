
import axios from 'axios'
export const axiosClient = axios.create({
  // thay đổi url ở đây
    baseURL: 'https://reqres.in/api',
    headers:{
        'Content-Type':'application/json',
        'x-api-key': 'reqres-free-v1',  
    },
});

const instance = axios.create();
// Interceptors
// Add a request interceptor
instance.interceptors.request.use(function (config) {
    // Do something before request is sent
    return config;
  }, function (error) {
    // Do something with request error
    return Promise.reject(error);
  });

// Add a response interceptor
instance.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  }, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    const {config , status , data} = error.response;
    if (config.url == '/login' && status == 400) { 
      const errorlist = data.data || []; 
      const firstError = errorlist.length > 0 ? errorlist[0]: {}; 
      const messageList = firstError.messages || []; 
      const firstMessage = messageList.length > 0 ? messageList[0]: {}; 
      throw new Error(firstMessage.message);
    }

    return Promise.reject(error);
  });


  export default axiosClient;

 