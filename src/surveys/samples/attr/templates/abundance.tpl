<div class="info-message">
  <p>Abundance (DAFOR, LA, LF or count)</p>
</div>
<div class="range">
  <input type="range" id="range" name="number" min="1" max="100" value="<%- obj.numberPosition || 1 %>">
  <input type="number" id="rangeVal" value="<%- obj.number %>">
</div>
<% obj.selection.forEach((option) => { %>
<label class="item item-radio">
  <input type="radio" name="group" value="<%= option %>" <%- option === obj.selected ? 'checked' : ''%>>
  <div class="radio-content">
    <div class="item-content">
      ${option}
    </div>
    <i class="radio-icon icon-check"></i>
  </div>
</label>
<% }) %>