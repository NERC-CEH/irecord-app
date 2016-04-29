<div class="activity">
  <label class="item item-radio">
    <input type="radio" name="group" value="<%= obj.id %>" <%- obj.checked ? 'checked' : ''%> />
    <div class="radio-content">
      <div class="item-content">
        <%= obj.title %>
        <p><%= obj.description %></p>
        <p><%= obj.type %></p>
      </div>
      <span class="radio-icon icon-check"></span>
    </div>
  </label>
</div>
