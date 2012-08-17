Chorus::Application.routes.draw do
  resource :sessions, :only => [:create, :destroy, :show]
  resource :config, :only => [:show], :controller => 'configurations'
  resources :activities, :only => [:index, :show], :controller => 'events'

  resources :users, :only => [:index, :show, :create, :update, :destroy] do
    collection do
      get :ldap
    end
    resource :image, :only => [:show, :create], :controller => :user_images
  end

  resources :hadoop_instances, :only => [:create, :index, :show, :update] do
    scope :module => 'hdfs' do
      resources :files, :only => [:show, :index], :constraints => {:id => /.*/}
      resources :contents, :only => :show, :constraints => {:id => /.*/}
    end
  end

  resources :instances, :only => [:index, :show, :create, :update] do
    resources :databases, :only => [:index], :controller => 'instance_databases'

    scope :module => 'instances' do
      resource :owner, :only => [:update], :controller => 'owner'
      resource :sharing, :only => [:create, :destroy], :controller => 'sharing'
      resource :account, :only => [:show, :create, :update, :destroy], :controller => 'account'
      resources :members, :only => [:index, :create, :update, :destroy]
    end
  end

  resources :databases, :only => [:show], :controller => 'instance_databases' do
    resources :schemas, :only => [:index]
  end

  resources :schemas, :only => [:show] do
    resources :datasets, :only => [:index]
    resources :functions, :only => [:index]
  end

  resources :tables, :only => [] do
    resource :analyze, :only => [:create], :controller => 'analyze'
  end

  resources :datasets, :only => [:show] do
    resources :columns, :only => [:index], :controller => 'column'
    resources :previews, :only => [:create, :destroy], :constraints => {:id => /.*/}
    resources :visualizations, :only => [:create, :destroy]
    resource :statistics, :only => :show
    resource :download, :only => :show, :controller => 'dataset_downloads'
    member do
      post :import
    end
  end

  resources :workspaces, :only => [:index, :create, :show, :update] do
    resources :members, :only => [:index, :create]
    resource :image, :only => [:create, :show], :controller => :workspace_images
    resources :workfiles, :only => [:create, :index]
    resource :quickstart, :only => [:destroy], :controller => "workspace_quickstart"
    resources :datasets, :only => [:index, :create, :show, :destroy], :controller => "workspace_datasets"
    resources :external_tables, :only => [:create]
    resources :csv, :only => [:create], :controller => 'workspace_csv' do
      member do
        put :import
      end
    end
  end

  resources :workfiles, :only => [:show, :destroy] do
    resource :draft, :only => [:show, :update, :create, :destroy], :controller => :workfile_draft
    resources :versions, :only => [:update, :create, :show, :index], :controller => 'workfile_versions'
    resource :copy, :only => [:create], :controller => 'workfile_copy'
    resource :download, :only => [:show], :controller => 'workfile_download'
    resource :executions, :only => [:create], :controller => 'workfile_executions'
  end

  resources :workfile_versions, :only => [:show] do
    resource :image, :only => [:show], :controller => 'workfile_version_images'
  end

  resources :notes, :only => [:create, :update, :destroy] do
    resources :attachments, :only => [:create, :show], :controller => 'note_attachments'
  end

  resources :attachments, :only => [] do
    resource :download, :only => [:show] , :controller => 'attachment_downloads'
  end

  resource :provisioning, :only => [:show], :controller => 'provisioning'

  scope :path => "/search" do
    resource :global, :only => [:show], :controller => 'search' do
      collection do
        post :reindex
      end
    end
  end

  post 'download_chart', :controller => 'image_downloads'

  match "/" => "root#index"
  match "VERSION" => "configurations#version"

  # TODO: Remove this when it's no longer needed
  match '*not_found' => 'root#not_found'
end
