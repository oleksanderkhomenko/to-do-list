(function () {
  'use strict';
  function append(item) {
    var $li = $('<li><input type="checkbox"> <input type="text"/> ' +
      '<button class="remove">&times;</button> <input type="color"/></li>');
    $li.find('input[type=text]').val(item.text);
    $li.find('input[type=checkbox]').attr("checked", item.checked);
    $li.find('input[type=color]').val(item.color);
    $li.css('background-color', item.color);
    $ul.append($li);
    return $li[0];
  }

  function addItem() {
    var item = {
      text: label.value,
      checked: false,
      color: ''
    };
    item.node = append(item);
    list.push(item);
    $label.val('');
    saveList();
  }

  function newList(arr) {
    if (Array.isArray(arr)) {
      list = arr;
      list.forEach(function (item) {
        item.node = append(item);
      });
    } else {
      list = [];
    }
  }

  function loadList() {
    $ul.empty();
    if (storage === 'local') {
      if (localStorage['todo-list']) {
        newList(JSON.parse(localStorage['todo-list']));
      }
    } else if (storage === 'server') {
      $.ajax('http://localhost:1337/', {
        type: 'GET',
        dataType: 'json'
      }).done(function (data) {
          newList(data);
        }).fail(function ($xhr, status, err) {
          list = [];
        });
    }
  }

  function saveList() {
    var newList = list.map(function (item) {
      return {
        text: item.text,
        checked: item.checked,
        color: item.color
      }
    });
    if (storage === 'local') {
      localStorage['todo-list'] = JSON.stringify(newList);
    } else if (storage === 'server') {
      if (saveTimeoutID) {
        clearTimeout(saveTimeoutID);
      }
      saveTimeoutID = setTimeout(function () {
        $.ajax('http://localhost:1337/', {
          type: 'POST',
          data: JSON.stringify(newList)
        });
      }, 500);
    }
  }

  var $ul = $('#item-list');
  var $label = $('#label');
  var storage = 'local';
  var list = [];
  var saveTimeoutID;

  // the app starts

  loadList();

  $('#add-item').on('click', addItem);
  $label.on('keyup', function (event) {
    if (event.keyCode == 13) {
      addItem();
    }
  });
  $('#remove-items').on('click', function () {
    list = list.filter(function (item) {
      return !item.checked;
    });
    $ul.find('li>input:checked').each(function () {
      $(this).parent().remove();
    });
    saveList();
  });
  $ul.on('change', 'input[type=checkbox]', function (event) {
    var $this = $(this);
    var $li = $this.parent();
    var status = $this.is(':checked');
    list.some(function (item) {
      if (item.node !== $li[0]) return false;
      item.checked = status;
      return true;
    });
    saveList();
  });
  $ul.on('change', 'input[type=color]', function (event) {
    var $this = $(this);
    var $li = $this.parent();
    var color = $this.val();
    $li.css('background-color', color);
    list.some(function (item) {
      if (item.node !== $li[0]) return false;
      item.color = color;
      return true;
    });
    saveList();
  });
  $ul.on('click', 'button', function (event) {
    var $this = $(this);
    var $li = $this.parent();
    list.some(function (item, id) {
      if (item.node !== $li[0]) return false;
      list.splice(id, 1);
      $li.remove();
      return true;
    });
    saveList();
  });
  $ul.on('keyup', 'input[type=text]', function () {
    var $this = $(this);
    var $li = $this.parent();
    var text = $this.val();
    list.some(function (item) {
      if (item.node !== $li[0]) return false;
      item.text = text;
      return true;
    });
    saveList();
  });
  $('#storage').on('change', 'input', function (event) {
    storage = this.value;
    loadList();
  });
})();