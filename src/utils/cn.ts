interface cnObjType {
  [className: string]: boolean;
}
export const cn = (...arg: (string | cnObjType | undefined | false)[]) => {
  const classNames: string[] = [];

  arg.map((el) => {
    if (typeof el === "string") {
      classNames.push(el);
    } else if (typeof el === "object") {
      for (const [className, display] of Object.entries(el)) {
        if (display) {
          classNames.push(className);
        }
      }
    }
  });

  return classNames.join(" ");
};
