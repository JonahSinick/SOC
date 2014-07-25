

json.extract! @question, :id, :title, :body, :created_at, :updated_at,:author_name

json.answers @question.answers do |answer|
  json.extract! answer, :id, :body, :author_id, :question_id, :author_name, :created_at, :updated_at
end

  
json.comments @question.comments do |comment|
  json.extract! comment, :id,
    :commentable_id,
    :commentable_type,
    :body,
    :author_name,
    :author_id,
    :created_at,
    :updated_at
end 
