<div class="info-message">
  <p>Please pick the life stage.</p>
</div>

<div class="list">
  <label class="item item-radio">
    <input type="radio" name="group" value="default"  <%- !_.keys(obj).length || obj['default'] ? 'checked' : ''%>>
    <div class="radio-content">
      <div class="item-content">
        Not recorded
      </div>
      <i class="radio-icon icon-check"></i>
    </div>
  </label>

  <label class="item item-radio">
    <input type="radio" name="group" value="Pre-adult" <%- obj['Pre-adult'] ? 'checked' : ''%>>
    <div class="radio-content">
      <div class="item-content">
        Pre-adult
      </div>
      <i class="radio-icon icon-check"></i>
    </div>
  </label>

  <label class="item item-radio">
    <input type="radio" name="group" value="Adult" <%- obj['Adult'] ? 'checked' : ''%>>
    <div class="radio-content">
      <div class="item-content">
        Adult
      </div>
      <i class="radio-icon icon-check"></i>
    </div>
  </label>

  <label class="item item-radio">
    <input type="radio" name="group" value="Other" <%- obj['Other'] ? 'checked' : ''%>>
    <div class="radio-content">
      <div class="item-content">
        Other
      </div>
      <i class="radio-icon icon-check"></i>
    </div>
  </label>
</div>