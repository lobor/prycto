import { useMutation, useQuery } from "@apollo/client";
import { useFormik } from "formik";
import Head from "next/head";
import { FormattedMessage } from "react-intl";
import * as Yup from "yup";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Label from "../../components/Label";
import Loading from "../../components/Loading";
import {
  UpdatePasswordDocument,
  UpdatePasswordMutation,
  UpdatePasswordMutationVariables,
  UpdateUserDocument,
  UpdateUserMutation,
  UpdateUserMutationVariables,
  UserDocument,
  UserQuery,
} from "../../generated/graphql";

const Settings = () => {
  const { data, loading } = useQuery<UserQuery>(UserDocument);
  const [updateUser, { loading: loadingUpdate }] = useMutation<
    UpdateUserMutation,
    UpdateUserMutationVariables
  >(UpdateUserDocument);
  const [updatePassword, { loading: loadingPassword }] = useMutation<
    UpdatePasswordMutation,
    UpdatePasswordMutationVariables
  >(UpdatePasswordDocument);

  const formikUser = useFormik({
    validationSchema: Yup.object({
      email: Yup.string().email().required(),
    }),
    enableReinitialize: true,
    initialValues: {
      email: (data && data.user.email) || "",
    },
    onSubmit: (values) => {
      if (data) {
        updateUser({ variables: { _id: data.user._id, ...values } });
      }
    },
  });
  const formik = useFormik({
    validationSchema: Yup.object({
      oldPassword: Yup.string()
        .required()
        .min(8, "Password is too short - should be 8 chars minimum.")
        .matches(/[a-zA-Z]/, "Password can only contain Latin letters."),
      password: Yup.string()
        .required()
        .min(8, "Password is too short - should be 8 chars minimum.")
        .matches(/[a-zA-Z]/, "Password can only contain Latin letters."),
      confirmPassword: Yup.string()
        .required()
        .oneOf([Yup.ref("password"), null], "Passwords must match"),
    }),
    enableReinitialize: true,
    initialValues: {
      oldPassword: "",
      password: "",
      confirmPassword: "",
    },
    onSubmit: (values) => {
      updatePassword({ variables: values })
    },
  });

  if (loading) {
    return (
      <div className="mt-20 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="text-gray-200">
      <Head>
        <title>Settings - Prycto</title>
        <meta name="description" content="Settings - Prycto" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {!loading && (
        <>
          <form
            onSubmit={formikUser.handleSubmit}
            className="m-auto w-1/3 mt-10"
          >
            <Label label={<FormattedMessage id="settings.email" />}>
              <Input
                name="email"
                type="email"
                onChange={formikUser.handleChange}
                value={formikUser.values.email}
                error={formikUser.errors.email as string}
              />
            </Label>
            <Button
              type="submit"
              disabled={
                !formikUser.isValid || formikUser.isSubmitting || loadingUpdate
              }
            >
              <FormattedMessage id="save" />
            </Button>
          </form>
          <form onSubmit={formik.handleSubmit} className="m-auto w-1/3 mt-10">
            <Label label={<FormattedMessage id="settings.oldPassword" />}>
              <Input
                name="oldPassword"
                type="oldPassword"
                onChange={formik.handleChange}
                value={formik.values.oldPassword}
                error={formik.errors.oldPassword as string}
              />
            </Label>
            <Label label={<FormattedMessage id="settings.password" />}>
              <Input
                name="password"
                type="password"
                onChange={formik.handleChange}
                value={formik.values.password}
                error={formik.errors.password as string}
              />
            </Label>
            <Label label={<FormattedMessage id="settings.confirmPassword" />}>
              <Input
                name="confirmPassword"
                type="confirmPassword"
                onChange={formik.handleChange}
                value={formik.values.confirmPassword}
                error={formik.errors.confirmPassword as string}
              />
            </Label>
            <Button
              type="submit"
              disabled={!formik.isValid || formik.isSubmitting}
            >
              <FormattedMessage id="save" />
            </Button>
          </form>
        </>
      )}
    </div>
  );
};

export default Settings;
