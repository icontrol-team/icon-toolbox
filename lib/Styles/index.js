import { h } from 'hyperapp';
import styled from 'hyperapp-styled-components';

export const Wrapper = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: row;
  width: 45%;
  overflow: scroll;
  left: 0px;
  top: 0px;
  bottom: 0px;
  flex-wrap: wrap;
  max-height: 99%;
  position: fixed;
  top: 230px;
`;

export const TextArea = styled.textarea`
  padding: 10px;
  margin-top: 10px;
  width: 100%;
  height: 70px;
  font-family: Arial;
`;

export const Button = styled.button`
/*  margin-top: 10px;
  margin-right: 10px; */
  box-shadow: inset 0px 1px 0px 0px #ffffff;
  background: linear-gradient(to bottom, #f9f9f9 5%, #e9e9e9 100%);
  background-color: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #dcdcdc;
  display: inline-block;
  cursor: pointer;
  color: #666666;
  font-family: Arial;
  font-size: 15px;
  font-weight: bold;
  padding: 6px 8px;
  text-decoration: none;
  text-shadow: 0px 1px 0px #ffffff;
  &:disabled {
    background: #dddddd;
    color: #aaaaaa;
  }
  &:hover:not([disabled]) {
    background:linear-gradient(to bottom, #e9e9e9 5%, #f9f9f9 100%);
    background-color:#e9e9e9;
  }
  &:active:not([disabled]){
    position:relative;
    top:1px;
  }
  &:focus:not([disabled]){
    outline:0;
    border:1px solid #8d8d8d;
  }
`;

export const PurpleButton = styled.button`
/*  margin-top: 10px;
  margin-right: 10px; */
  white-space: normal; 
  word-wrap: break-word;
  height:30px;
  margin: 10px 0px 0px 0px;
  box-shadow: inset 0px 1px 0px 0px #ffffff;
  background:linear-gradient(0deg,hsl(274deg 69% 57%),hsl(209deg 65% 54%) 98.44%);
  background-color: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #310b37;
  display: inline-block;
  cursor: pointer;
  color: #ffffff;
  font-family: Arial;
  font-size: 13px;
  font-weight: bold;
  padding: 2px 4px;
  text-decoration: none;
  text-shadow: 0px 1px 0px #4a4a4a;
  &:disabled {
    background: #dddddd;
    color: #aaaaaa;
  }
  &:hover:not([disabled]) {
    background:linear-gradient(180deg,hsl(274deg 69% 57%),hsl(209deg 65% 54%) 98.44%);
    background-color:#e9e9e9;
  }
  &:active:not([disabled]){
    position:relative;
    top:0px;
  }
  &:focus:not([disabled]){
    outline:0;
    border:1px solid #8d8d8d;
  }
`;

export const Logging = styled.div`
  border: 1px solid #ccc;
  width: 43%;
  margin: 10px;
  font-family: Aria;
  position: absolute;
  word-wrap: break-word;
  padding: 10px 10px 10px 10px;
  bottom: 50px;
  top: 110px;
  right: 0px;
  overflow: scroll;
  overflow-x: hidden;
  font-size: 13px;
  font-famliy: 'Spoqa Han Sans';
`;

export const Console = styled.input`
  position: absolute;
  display: block;
  line-height: 15px;
  padding-top: 0px;
  bottom: 0px;
  height: 40px;
  margin-bottom: 10px;
  right: 35px;
  padding-right: 20px;
  padding-left: 23px;
  border: 0px;
  letter-spacing: 0.5px;
  font-size: 15px;
  width: 40%;
  outline: none;
  background: url(https://png.pngtree.com/svg/20160727/0bf24b248b.svg);
  background-position: 0px 10px;
  background-repeat: no-repeat;
  background-size: 20px 20px;

  &:focus {
    color: none;
    outline: none;
  }
`;

export const Column = styled.div`
  // margin-left: 3px;
  padding-bottom: 100px;
`;

export const SettingPage = styled.fieldset`
  border: 1px solid #ccc;
  width: 43%;
  margin: 0px 10px;
  font-family: Aria;
  position: absolute;
  word-wrap: break-word;
  padding: 0px 10px 10px 10px;
  top: 0px;
  right: 0px;
  overflow: scroll;
  overflow-x: hidden;
  font-size: 13px;
`;

export const Setting = styled.fieldset`
  
  /** resize: both; **/
  
  overflow: hidden;
 
  border: 1px solid #ccc;
  margin: 0px 10px;
  font-family: Aria;
  word-wrap: break-word;
  padding: 0px 10px 10px 10px;
  margin-top: 10px;

  top: 0px;
  right: 0px;
  /** overflow: scroll;
  overflow-x: hidden;
  **/
  font-size: 13px;

`;

// export const Setting = styled.div`
//   border: 1px solid #ccc;
//   margin: 10px 10px;
//   font-family: Aria;
//   padding: 0px 10px 10px 10px;
//   font-size: 13px;
//   legend &{
//     position: absolute;
//     top: 0;
//     left: 10px;
//     z-index: 1;
//     color: black;
//     font-size: 12px;
//     background: #EEEEEE;
//     border: 1px solid #DADADA;
//     -moz-border-radius: 20px;
//     -webkit-border-radius: 20px;
//         border-radius: 20px;
//         padding: 4px 8px;
//   }
//
// `;




export const GroupField = styled.fieldset`
  border: 1px solid #ccc;
  margin: 10px 10px;
  word-wrap: break-word;
  padding: 15px 10px 10px 10px;
  top: 0px;
  right: 0px;
  font-size: 13px;
  border-radius: 2px;
  background-color: #ffffff;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.3);
`;

export const InputBox =  styled.input`
  border: 1px solid #ccc;
  margin: 5px;
  padding: 5px;
  width: 200px;
`


export const Title = styled.span`
  /* border-bottom: 2px solid rgb(237, 237, 237); padding: 7px;*/
  /* margin-left: 10px; */
  color:#707070;
  font-size: 14px;
  font-weight: 500;
  margin-right: 5px;
`

export const Navigation = styled.ul`
`
