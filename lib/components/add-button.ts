function AddButton(random_id_suffix: string, innerText: string, f: Function): HTMLButtonElement {
    // Generic Button
    const genericBtn = document.createElement('button');
          genericBtn.id =
            innerText.toLowerCase().split(' ').join('_') + "-" + random_id_suffix;
          genericBtn.innerText = innerText;
          // genericBtn.style.backgroundColor = 'transparent';
          // genericBtn.style.padding = '2px';
          // genericBtn.style.border = 'solid';
          // genericBtn.style.borderWidth = "1px";
          // genericBtn.style.font = 'inherit';
          // genericBtn.style.color = 'inherit';
          // genericBtn.style.cursor = 'pointer';
          genericBtn.addEventListener('click', () => {
            f();
          });
  
    return genericBtn;
  }

export { AddButton }