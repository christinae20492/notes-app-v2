"use client";

import { Authenticator } from "@aws-amplify/ui-react";
import Layout from "./layout";
import '@aws-amplify/ui-react/styles.css';

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <Authenticator.Provider>
      <Authenticator>
        {({ user }) => (user ? <Layout>{children}</Layout> : null)}
      </Authenticator>
    </Authenticator.Provider>
  );
};

export default AuthProvider;
