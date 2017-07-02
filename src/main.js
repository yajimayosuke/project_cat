'use strict';

// ノードが読み込まれたときに処理を実行する
document.addEventListener('DOMContentLoaded',() => {
  const btn = document.getElementById('send_message_btn');

  btn.addEventListener('click', function (e) {
    e.preventDefault();
    const form = document.getElementsByTagName('form').form;
    const message = form.getElementsByTagName('textarea').input_message.value;
    const data = {
      message,
      date: new Date()
    };

    postComment(data);
  });

  // textareaにフォーカスインする
  document.getElementById('input_message').focus();
});

function xhrErrorHandler(res){
  if(res.ok) return res;
  throw Error(res.statusText);
}

function postComment(data) {
  fetch('http://localhost:3000/comment',{
    method: 'POST',
    body: JSON.stringify(data),
    mode: 'cors'
  }).then(xhrErrorHandler)
    .then(success)
    .catch(err => window.console.error(err));
}

// 通信成功時のコールバック
function success() {
  const idNames = [
    'contents', 'textarea_wrap', 'mail_top',
    'send_message_btn', 'cat_icon', 'form',
    'result', 'mail_back', 'mail_front'
  ];

  const nodes = idNames.map(id => [id, document.getElementById(id)]);
  const target = new Map(nodes);

  // アニメーションの開始
  target.forEach(node => node.classList.add('animation'));

  target.get('result').addEventListener('animationend', resultCallbackCreate(target));
}

function animationInitialize(target) {
  // formを隠す
  target.get('form').style.visibility = 'hidden';

  target.forEach(node => node.classList.remove('animation'));

  // 入力したメッセージ(あれな内容)を抹消
  document.getElementById('input_message').value = '';
}

function showMailForm(target) {
  target.get('mail_back').style.visibility = 'hidden';
  target.get('mail_front').style.visibility = 'hidden';
  target.get('mail_top').style.visibility = 'hidden';
  target.get('form').style.visibility = '';
}

function resultCallbackCreate(target) {
  return function resultCallback() {
    animationInitialize(target);
    showMailForm(target);

    const textarea = target.get('textarea_wrap');
    textarea.addEventListener('animationend',textareaCallbackCreate(target));

    // textarea出現アニメーション開始
    textarea.classList.add('show_textarea_animation');

    target.get('result').removeEventListener('animationend', resultCallback);
  };
}

function textareaCallbackCreate(target) {
  // 初期化アニメーション後の処理
  return function textareaCallback() {
    const textarea = target.get('textarea_wrap');
    //初期化
    textarea.classList.remove('show_textarea_animation');
    target.get('mail_back').style.visibility = '';
    target.get('mail_front').style.visibility = '';
    target.get('mail_top').style.visibility = '';

    textarea.focus();
    textarea.removeEventListener('animationend', textareaCallback);
  };
}