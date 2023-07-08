export const input = (style, props) => {
  return <input id={props.id} type='text' style={style} maxLength={props ? props.maxLength : 100} />
}
