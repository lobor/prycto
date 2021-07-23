import Head from "next/head";
import * as Yup from "yup";
import Snackbar from "../components/Snackbar";
import Input from "../components/Input";
import Button from "../components/Button";
import { useFormik } from "formik";
import Label from "../components/Label";
import { useMutation, useQuery } from "@apollo/client";
import {
  RegisterDocument,
  RegisterMutation,
  RegisterMutationVariables,
  UserDocument,
  UserQuery,
} from "../generated/graphql";
import { useRouter } from "next/dist/client/router";
import { FormattedMessage } from "react-intl";
import SelectLang from "../components/SelectLang";
import { useEffect } from "react";
import Loading from "../components/Loading";

export default function Home() {
  const router = useRouter();
  const { data: dataUser, loading: loadingUser } =
    useQuery<UserQuery>(UserDocument);
  const [register, { data, error }] = useMutation<
    RegisterMutation,
    RegisterMutationVariables
  >(RegisterDocument, {
    onCompleted: () => {
      router.push("/login");
    },
  });

  useEffect(() => {
    if (dataUser && !loadingUser) {
      router.push("/positions");
    }
  }, [dataUser, loadingUser]);

  const formik = useFormik({
    validationSchema: Yup.object({
      email: Yup.string().email().required(),
      password: Yup.string()
        .required()
        .min(8, "Password is too short - should be 8 chars minimum.")
        .matches(/[a-zA-Z]/, "Password can only contain Latin letters."),
      confirmPassword: Yup.string()
        .required()
        .oneOf([Yup.ref("password"), null], "Passwords must match"),
    }),
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    onSubmit: (values) => {
      register({ variables: values });
    },
  });

  if (loadingUser) {
    return (
      <div className="m-auto flex justify-center w-full">
        <Loading />
      </div>
    );
  }

  return (
    <div>
      <Head>
        <title>Create account - Prycto</title>
        <meta name="description" content="Create account - Prycto" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Snackbar />
      <div className="flex content-center items-center flex-col mt-40 text-gray-200">
        <div className="flex items-center flex-col w-1/6">
        <h1 className="w-full flex justify-between text-2xl">
            <span>
              <FormattedMessage id="register" />
            </span>
            <SelectLang />
          </h1>
          <form onSubmit={formik.handleSubmit} className="inline-block w-full mt-10">
            <Label label={<FormattedMessage id="email" />}>
              <Input
                name="email"
                type="email"
                onChange={formik.handleChange}
                value={formik.values.email}
                error={formik.touched.email && formik.errors.email}
              />
            </Label>
            <Label label={<FormattedMessage id="password" />}>
              <Input
                type="password"
                name="password"
                onChange={formik.handleChange}
                value={formik.values.password}
                error={formik.touched.password && formik.errors.password}
              />
            </Label>
            <Label label={<FormattedMessage id="settings.confirmPassword" />}>
              <Input
                type="password"
                name="confirmPassword"
                onChange={formik.handleChange}
                value={formik.values.confirmPassword}
                error={
                  formik.touched.confirmPassword &&
                  formik.errors.confirmPassword
                }
              />
            </Label>
            {error && <div className="text-red-600 pb-2">{error.message}</div>}
            <div className="flex flex-row justify-between">
              <Button variant="link" onClick={() => router.push("/login")}>
                <FormattedMessage id="login" />
              </Button>
              <Button type="submit">{<FormattedMessage id="register" />}</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
