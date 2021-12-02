import React from "react";
import { StyledButton } from "./style";

export default function Button(props: { children: string }) {
  return <StyledButton>{props.children}</StyledButton>;
}
