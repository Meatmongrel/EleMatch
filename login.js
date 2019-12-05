let form = document.querySelector('#login')

form.addEventListener('submit', event => {
    event.preventDefault()
    let formData = new FormData(form)
    localStorage.setItem('username', formData.get('name'))
    window.location.href = '/game.html'
})