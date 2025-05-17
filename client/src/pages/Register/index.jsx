import React from 'react'
import PropTypes from 'prop-types'
import RegisterForm from '../../features/Auth/components/RegisterForm'
import { useDispatch } from 'react-redux'
import { register } from '../userSlice'
import { unwrapResult } from '@reduxjs/toolkit'

export const Register = props => {
  const dispatch = useDispatch()

  const handleSubmit = async (values) => {
    try {
      const submitValues = {
        email: values.email,
        password: values.password,
      };

      const action = register(submitValues);
      const resultAction = await dispatch(action);
      unwrapResult(resultAction);
      
      // Nếu đăng ký thành công, đóng dialog
      const { closedialog } = props;
      if (closedialog) {
        closedialog();
      }
    } catch (error) {
      console.error('Failed to register:', error);
    }
  };

  return (
    <div>
      <RegisterForm onSubmit={handleSubmit} />
    </div>
  )
}


Register.propTypes = {
  closedialog : PropTypes.func,
}

export default Register