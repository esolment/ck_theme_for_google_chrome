const form = document.getElementById('searchForm');
const input = document.getElementById('search');
const suggestions = document.getElementById('suggestions');
let scriptTag;

// Голосовой поиск через Web Speech API
const voiceBtn = document.getElementById('voiceBtn');
let recognition;
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = 'ru-RU';
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    input.value = transcript;
    input.dispatchEvent(new Event('input'));
  };
  recognition.onerror = (event) => {
    alert('Ошибка распознавания речи: ' + event.error);
  };

  voiceBtn.onclick = () => {
    recognition.start();
  };
} else {
  voiceBtn.disabled = true;
  voiceBtn.title = 'Голосовой поиск не поддерживается в вашем браузере';
}

function handleSuggestions(data) {
  const results = data[1];
  if (!results.length) {
    suggestions.classList.remove('show');
    return;
  }
  suggestions.innerHTML = '';
  results.forEach(item => {
    const div = document.createElement('div');
    div.textContent = item;
    div.onclick = () => {
      input.value = item;
      suggestions.classList.remove('show');
      input.focus();
    };
    suggestions.appendChild(div);
  });
  suggestions.classList.add('show');
}

function isDomain(str) {
  return /\./.test(str) && !/\s/.test(str) && !/^https?:\/\//i.test(str);
}

input.addEventListener('input', () => {
  const query = input.value.trim();
  if (!query) {
    suggestions.classList.remove('show');
    return;
  }
  if (scriptTag) document.body.removeChild(scriptTag);
  scriptTag = document.createElement('script');
  scriptTag.src = `https://suggestqueries.google.com/complete/search?client=firefox&hl=ru&q=${encodeURIComponent(query)}&callback=handleSuggestions`;
  document.body.appendChild(scriptTag);
});

form.addEventListener('submit', e => {
  e.preventDefault();
  let query = input.value.trim();
  if (!query) return;

  if (isDomain(query)) {
    if (!/^https?:\/\//i.test(query)) {
      query = 'https://' + query;
    }
    window.open(query, '_self');
  } else {
    location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  }
});

document.addEventListener('click', e => {
  if (!e.target.closest('form')) {
    suggestions.classList.remove('show');
  }
});