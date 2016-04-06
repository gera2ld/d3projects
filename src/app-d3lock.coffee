d3lock = require './d3lock'
$ = require './d3utils'
  .$

module.exports = ->
  title = $ '.lock-title'
  body = $ '.lock-body'
  reset = $ '.lock-reset'

  lockData = mode = checkData = null

  recordData = (data) ->
    lockData = data
    setMode 2
    true

  confirmData = (data) ->
    ok = _.isEqual lockData, data
    if ok
      setMode 0
    else
      lockData = null
      title.innerHTML = '两次解锁图案不一样，请重新设置！'
      _.delay ->
        setMode 1
      , 1000
    ok

  validateData = (data) ->
    ok = _.isEqual lockData, data
    if ok
      title.innerHTML = '解锁成功！'
    else
      title.innerHTML = '解锁失败！'
    _.delay ->
      setMode mode
    , 1000
    ok

  setMode = (_mode) ->
    switch _mode
      when 0
        title.innerHTML = '请解锁'
        checkData = validateData
        reset.style.display = 'block'
      when 1
        title.innerHTML = '绘制解锁图案'
        lockData = null
        checkData = recordData
        reset.style.display = 'none'
      when 2
        title.innerHTML = '确认解锁图案'
        checkData = confirmData
      else
        return
    mode = _mode

  onReset = -> setMode 1

  body.appendChild d3lock
    width: '100%'
    height: '100%'
    checkData: (data) -> checkData data

  reset.addEventListener 'click', onReset , false
  do onReset
