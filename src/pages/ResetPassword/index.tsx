import { FormHandles } from '@unform/core';
import { Form } from '@unform/web';
import React, { useCallback, useRef } from 'react';
import { FiLock, FiLogIn } from 'react-icons/fi';
import { Link, useHistory, useLocation } from 'react-router-dom';
import * as Yup from 'yup';
import logoImg from '../../assets/logo.svg';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useToast } from '../../hooks/toast';
import api from '../../services/api';
import getValidationErrors from '../../utils/getValidationErrors';
import { AnimationContent, Background, Container, Content } from './styles';

interface ResetPasswordFormData {
  password: string;
  password_confirmation: string;
}

const SignIn: React.FC = () => {
  const formRef = useRef<FormHandles>(null);

  const { addToast } = useToast();
  const history = useHistory();
  const location = useLocation();

  const handleSubmit = useCallback(
    async (data: ResetPasswordFormData) => {
      try {
        formRef.current?.setErrors({});
        const schema = Yup.object().shape({
          password: Yup.string().required('Senha obrigatória'),
          password_confirmation: Yup.string().oneOf(
            [Yup.ref('password'), null],
            'Confirmação não é igual a nova senha',
          ),
        });

        await schema.validate(data, { abortEarly: false });
        const token = location.search.replace('?token=', '');

        if (!token) {
          throw new Error();
        }

        await api.post('/password/reset', {
          password: data.password,
          password_confirmation: data.password_confirmation,
          token,
        });

        history.push('/');
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);
          formRef.current?.setErrors(errors);
          return;
        }
        addToast({
          type: 'error',
          title: 'Erro ao resetar senha',
          description: 'Ocorreu um erro ao resetar sua senha, tente novamentes',
        });
      }
    },
    [addToast, history, location],
  );

  return (
    <>
      <Container>
        <Content>
          <AnimationContent>
            <img src={logoImg} alt="GoBarber" />
            <Form ref={formRef} onSubmit={handleSubmit}>
              <h1>Resetar senha</h1>
              <Input
                name="password"
                icon={FiLock}
                type="password"
                placeholder="Nova senha"
              />

              <Input
                name="password_confirmation"
                icon={FiLock}
                type="password"
                placeholder="Confirmação da senha"
              />
              <Button type="submit">Alterar senha</Button>
            </Form>
            <Link to="/signin">
              <FiLogIn />
              Voltar ao login
            </Link>
          </AnimationContent>
        </Content>
        <Background />
      </Container>
    </>
  );
};

export default SignIn;
