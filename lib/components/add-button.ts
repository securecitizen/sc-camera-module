function AddButton(random_id_suffix: string, innerText: string, f: Function): HTMLButtonElement {
    // Generic Button
    const genericBtn = document.createElement('button');
          genericBtn.id =
            innerText.toLowerCase().split(' ').join('_') + "-" + random_id_suffix;
          genericBtn.innerText = innerText;
          genericBtn.className = 'button';
          genericBtn.addEventListener('click', () => {
            f();
          });
  
    return genericBtn;
  }

export { AddButton }