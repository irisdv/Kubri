import styled from "styled-components";

export const FileUploadButton = styled.button`
  box-sizing: border-box;
  appearance: none;
  background-color: transparent;
  border: 2px solid #9D95CB;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0.8em 0.8em;
  text-align: center;
  font-weight: 700;
  border-radius: 6px;
  color: #9D95CB;
  position: relative;
  overflow: hidden;
  z-index: 1;
  transition: color 250ms ease-in-out;
  font-family: "Open Sans", sans-serif;
  width: 45%;
  display: flex;
  align-items: center;
  justify-content: center;
  &:after {
    content: "";
    position: absolute;
    display: block;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 100%;
    background: #9D95CB;
    z-index: -1;
    transition: width 250ms ease-in-out;
  }
  i {
    font-size: 22px;
    margin-right: 5px;
    border-right: 2px solid;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 20%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  @media only screen and (max-width: 500px) {
    width: 70%;
  }
  @media only screen and (max-width: 350px) {
    width: 100%;
  }
  &:hover {
    color: #fff;
    outline: 0;
    background: transparent;
    &:after {
      width: 110%;
    }
  }
  &:focus {
    outline: 0;
    background: transparent;
  }
  &:disabled {
    opacity: 0.4;
    filter: grayscale(100%);
    pointer-events: none;
  }
`;