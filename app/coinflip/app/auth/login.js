import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import { useContext, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import * as Yup from 'yup';
import { AuthContext } from '../../context/AuthContext';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const LoginScreen = () => {
  const { login } = useContext(AuthContext);
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            setErrorMessage('');
            await login(values.email, values.password);
          } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Login failed');
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
          <View style={styles.form}>
            <Text style={styles.title}>Welcome Back</Text>

            <TextInput
              label="Email"
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              keyboardType="email-address"
              mode="outlined"
              style={styles.input}
              error={touched.email && !!errors.email}
            />
            <HelperText type="error" visible={touched.email && !!errors.email}>
              {errors.email}
            </HelperText>

            <TextInput
              label="Password"
              value={values.password}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              secureTextEntry
              mode="outlined"
              style={styles.input}
              error={touched.password && !!errors.password}
            />
            <HelperText type="error" visible={touched.password && !!errors.password}>
              {errors.password}
            </HelperText>

            {errorMessage ? (
              <HelperText type="error" visible>
                {errorMessage}
              </HelperText>
            ) : null}

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
              style={styles.button}
            >
              Login
            </Button>

            <TouchableOpacity onPress={() => router.push('/auth/register')}>
              <Text style={styles.switchText}>
                Don't have an account? <Text style={styles.link}>Register</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
    paddingVertical: 6,
  },
  switchText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
  link: {
    color: '#007bff',
    fontWeight: '600',
  },
});

export default LoginScreen;

