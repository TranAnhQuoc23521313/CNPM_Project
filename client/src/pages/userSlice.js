import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userApi from '../services/api/userApi'

// register 
export const register = createAsyncThunk('user/register', async (payload) => {
  const data = await userApi.register(payload);
  
  
  localStorage.setItem('access_token', data.data.token);
  localStorage.setItem('user', JSON.stringify(data.data));
    return data.data;
});
// login 
export const login = createAsyncThunk('user/login', async (payload) => {
    const data = await userApi.login(payload);
  
    
    localStorage.setItem('access_token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data));
      return data.data;
  });

const userSlice = createSlice({
  name: 'user',
  initialState: {
    current: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(register.fulfilled, (state, action) => {
      state.current = action.payload;
    });
    builder.addCase(login.fulfilled, (state, action) => {
        state.current = action.payload;
      });
  },
});

export default userSlice.reducer;
