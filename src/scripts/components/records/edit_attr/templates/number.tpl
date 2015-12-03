<div class="info-message">
  <p>How many individuals of this type?</p>
</div>

<div class="list">
  <label class="item item-radio">
    <input type="radio" name="group" value=" " <%- !_.keys(obj).length || obj[' '] ? 'checked' : ''%>>
    <div class="radio-content">
      <div class="item-content">
        Present
      </div>
      <i class="radio-icon icon-check"></i>
    </div>
  </label>

  <label class="item item-radio">
    <input type="radio" name="group" value="1" <%- obj['1'] ? 'checked' : ''%>>
    <div class="radio-content">
      <div class="item-content">
        1
      </div>
      <i class="radio-icon icon-check"></i>
    </div>
  </label>

  <label class="item item-radio">
    <input type="radio" name="group" value="2-10" <%- obj['2-10'] ? 'checked' : ''%>>
    <div class="radio-content">
      <div class="item-content">
        2-10
      </div>
      <i class="radio-icon icon-check"></i>
    </div>
  </label>

  <label class="item item-radio">
    <input type="radio" name="group" value="11-100" <%- obj['11-100'] ? 'checked' : ''%>>
    <div class="radio-content">
      <div class="item-content">
        11-100
      </div>
      <i class="radio-icon icon-check"></i>
    </div>
  </label>

  <label class="item item-radio">
    <input type="radio" name="group" value="101-500" <%- obj['101-500'] ? 'checked' : ''%>>
    <div class="radio-content">
      <div class="item-content">
        101-500
      </div>
      <i class="radio-icon icon-check"></i>
    </div>
  </label>

  <label class="item item-radio">
    <input type="radio" name="group" value="500+" <%- obj['500+'] ? 'checked' : ''%>>
    <div class="radio-content">
      <div class="item-content">
        500+
      </div>
      <i class="radio-icon icon-check"></i>
    </div>
  </label>

</div>

<!--<ul class="list">-->

  <!--<li class="item item-checkbox">-->
    <!--<label class="checkbox">-->
      <!--<input type="checkbox">-->
    <!--</label>-->
    <!--Flux Capacitor-->
  <!--</li>-->

  <!--<li class="item item-checkbox">-->
  <!--<label class="checkbox">-->
    <!--<input type="checkbox">-->
  <!--</label>-->
  <!--Flux Capacitor-->
<!--</li>-->
<!--</ul>-->