'use strict';

(function () {

  // 本日の投稿件数を取得：即実行!!!
  getTodaysPostCount();

  /**
   * ノードが読み込まれたときに処理を実行(タイミングは $(); と一緒 )
   */
  document.addEventListener('DOMContentLoaded', function () {

    // ノード取得
    var btn = document.getElementById('send_message_btn'),
        // 投稿ボタン
    textArea = document.getElementById('input_message'); // テキストエリア

    /**
     * イベント登録
     */
    // 投稿ボタンがクリックされた時のイベント
    btn.addEventListener('click', function (e) {

      // ボタンのクリックイベントをキャンセルする(submit処理キャンセル)
      e.preventDefault();

      // ノードを取得
      var form = document.getElementsByTagName('form').form,
          message = form.getElementsByTagName('textarea').input_message.value;

      // エラーメッセージの初期化
      removeErrorMSG();

      // 空文字入力チェック
      if (message.trim()) {
        // OK

        // 送信データを作成
        var data = {
          message: message,
          date: new Date()
        };

        // サーバに送信
        postComment(data);
      } else {
        // NG

        //空文字または改行のみのサブミット時にエラーメッセージを表示.
        inputError();
      }
    });

    // メッセージが入力された時のイベント
    textArea.addEventListener('input', function () {

      // 入力されたメッセージを取得
      var messages = this.value;

      // 入力文字数をテキストエリア右下に表示させる.
      document.getElementById('text_length').innerHTML = messages.trim().length + '/128';
      //エラーメッセージの初期化
      document.getElementById('error_text').innerHTML = "";
    });

    // textareaにフォーカスインする
    document.getElementById('input_message').focus();
  });

  // ここから関数を定義

  /**
   * 引数の日付の投稿件数を取得する | default: new Date
   * （非同期通信）
   */
  function getTodaysPostCount() {
    var date = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Date();


    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        if (xhr.status == 200 || xhr.status == 304) {
          // 成功時
          document.getElementById('today_post').textContent = '\u672C\u65E5\u306E\u6295\u7A3F\u4EF6\u6570\uFF1A' + JSON.parse(xhr.responseText).count + '\u4EF6';
        } else {
          // 失敗時
          console.log('m9(^\u0414^)\uFF8C\uFF9F\uFF77\uFF9E\uFF6C\uFF70\uFF1A ' + xhr.statusText);
        }
        // 接続を切る
        xhr.abort();
      }
    };

    // 接続
    xhr.open('GET', 'http://localhost:3000/comment/count?date=' + date.toJSON(), true);
    xhr.send();
  }

  /**
   * サーバにメッセージを送信する(非同期通信) 
   */
  function postComment(data) {

    // headerオブジェクトを生成
    var myHeaders = new Headers();
    // header情報をセット
    myHeaders.append('Content-Type', 'application/json');

    // FetchAPIを使用
    fetch('http://localhost:3000/comment', {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify(data),
      mode: 'cors'
    }).then(xhrErrorHandler).then(success).catch(function (err) {
      return window.console.error(err);
    });
  }

  /**
   * サーバ通信に失敗した時のコールバック
   */
  function xhrErrorHandler(res) {
    if (res.ok) return res;
    throw Error(res.statusText);
  }

  /**
   * サーバ通信に成功した時のコールバック
   */
  function success() {
    // id属性の名前（配列）
    var idNames = ['contents', 'textarea_wrap', 'mail_top', 'send_message_btn', 'cat_icon', 'form', 'result', 'mail_back', 'mail_front'];

    // idの配列から、ノード（配列）を取得
    var nodes = idNames.map(function (id) {
      return [id, document.getElementById(id)];
    });

    // mapオブジェクトを生成
    var target = new Map(nodes);

    // アニメーションの開始 (送信アニメーション)
    target.forEach(function (node) {
      return node.classList.add('animation');
    });

    // resultノードを取り出して、アニメーション終了処理を登録
    target.get('result').addEventListener('animationend', resultCallbackCreate(target));
  }

  /**
   * 送信アニメーション終了時のコールバック
   */
  function resultCallbackCreate(target) {

    return function resultCallback() {

      // 初期化
      animationInitialize(target);
      // formを再表示
      showMailForm(target);

      // Mapからtextareaノードを取得
      var textarea = target.get('textarea_wrap');
      // アニメーション終了イベントを登録
      textarea.addEventListener('animationend', textareaCallbackCreate(target));

      // textarea出現アニメーション開始
      textarea.classList.add('show_textarea_animation');

      target.get('result').removeEventListener('animationend', resultCallback);
    }; //ここまでresultCallback
  }

  /**
   * アニメーション初期化(アニメーションclassを削除)
   */
  function animationInitialize(target) {
    // formを隠す
    target.get('form').style.visibility = 'hidden';

    target.forEach(function (node) {
      return node.classList.remove('animation');
    });

    // 入力したメッセージ(あれな内容)を抹消
    document.getElementById('input_message').value = '';
    document.getElementById('text_length').innerHTML = '0/128';
  }

  /**
   * 封筒を非表示にして、formを表示する
   */
  function showMailForm(target) {
    target.get('mail_back').style.visibility = 'hidden';
    target.get('mail_front').style.visibility = 'hidden';
    target.get('mail_top').style.visibility = 'hidden';
    target.get('form').style.visibility = '';
  }

  /**
   * textareaの初期化
   */
  function textareaCallbackCreate(target) {
    // textareのコールバック
    return function textareaCallback() {
      var textarea = target.get('textarea_wrap');
      //初期化
      textarea.classList.remove('show_textarea_animation');
      target.get('mail_back').style.visibility = '';
      target.get('mail_front').style.visibility = '';
      target.get('mail_top').style.visibility = '';

      // 再びフォーカスイン
      textarea.focus();
      // アニメーション終了後、自身イベントを解除
      textarea.removeEventListener('animationend', textareaCallback);
    };
  }

  /**
   * 空文字の時のエラーメッセージの表示
   */
  function inputError() {
    // ノード取得
    var error = document.getElementById('error_text');
    // クラス属性を追加
    var redError = error.setAttribute('class', 'error');
    // テキストノードを作成
    var textError = document.createTextNode('文字を入力してください');
    //　ノードを追加
    error.appendChild(textError);
  }

  /**
   * エラーメッセージの初期化
   */
  function removeErrorMSG() {
    // 子孫ノードを初期化
    document.getElementById('error_text').innerHTML = "";
  }
})();
