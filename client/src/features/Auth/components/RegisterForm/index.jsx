import React from 'react';
import PropTypes from 'prop-types';
import InputField from '../../../../components/form-controls/InputField';
import { useForm } from 'react-hook-form';
import { Avatar, Typography, Button, Box , LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import PasswordField from '../../../../components/form-controls/passwordfield';

import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';


// Styled components
const Root = styled(Box)(({ theme }) => ({
  position: 'relative',
  paddingTop: theme.spacing(4),
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  margin: '0 auto',
  backgroundColor: theme.palette.secondary.main,
}));

const Title = styled(Typography)(({ theme }) => ({
  margin: theme.spacing(2, 0, 3, 0),
  textAlign: 'center',
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
}));

const Progress = styled(LinearProgress)(({ theme }) => ({
  position : 'absolute',
  top: theme.spacing(1),
  left : 0,
  right: 0,
}));


const RegisterForm = (props) => {

  // validation
  const schema = yup.object().shape({
    fullname: yup
      .string()
      .required('Please enter your full name')
      .test(
        'should-have-two-words',
        'Please enter at least two words.',
        (value) => value && value.trim().split(' ').filter(word => word).length >= 2
      ),
  
    email: yup
      .string()
      .email('Invalid email')
      .required('Email is required'),
  
    password: yup
      .string()
      .min(6, 'At least 6 characters')
      .required('Password is required'),
  
      retypepassword: yup
      .string()
      .required('Retype your password')
      .oneOf([yup.ref('password')], 'Passwords must match'),
      
  });
  const form = useForm({
    defaultValues: {
      fullname: '',
      email: '',
      password: '',
      retypepassword: '',
    },
    resolver: yupResolver(schema), // tích hợp yup
  });

  const onSubmit = async (values) => {
    const {onSubmit} = props;
    if (onSubmit) {
      await onSubmit(values);
    }
    form.reset();
  };
  const {isSubmitting} = form.formState;
  return (
    <Root>

      {isSubmitting && <Progress /> }
      <StyledAvatar />
      <Title component="h3" variant="h5">
        Create An Account
      </Title>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <InputField name="fullname" label="Full Name" form={form} />
        <InputField name="email" label="Email" form={form} />
        <PasswordField name="password" label="Password" form={form} />
        <PasswordField name="retypepassword" label="Retype Password" form={form} />

        <SubmitButton disabled = {isSubmitting}  variant="contained" color="primary" type="submit" fullWidth>
            Sign Up
        </SubmitButton>
      
      </form>
    </Root>
  );
};

RegisterForm.propTypes = {
  onSubmit: PropTypes.func,
};

export default RegisterForm;


